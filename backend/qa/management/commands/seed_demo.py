from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from datetime import date, timedelta
from qa.models import Module, Question, Answer, QuestionVote, AnswerVote
from sessions_app.models import StudySession
from notifications_app.models import Notification


class Command(BaseCommand):
    help = 'Seed demo data for presentation'

    def handle(self, *args, **options):
        w = self.stdout.write

        # ── 1. Users ────────────────────────────────────────────────────────────
        yanis = self._get_or_create_user('yanis@estin.dz', 'Yanis', 'demo1234')
        meriem = self._get_or_create_user('meriem@estin.dz', 'Merième', 'demo1234')

        # Extra voters so vote counts look realistic (3–4 upvotes per item)
        amine = self._get_or_create_user('amine@estin.dz', 'Amine', 'demo1234')
        lina  = self._get_or_create_user('lina@estin.dz',  'Lina',  'demo1234')
        rayan = self._get_or_create_user('rayan@estin.dz', 'Rayan', 'demo1234')
        w('  Users ready')

        # ── 2. Modules ───────────────────────────────────────────────────────────
        MODULE_DEFS = [
            ('CS201', 'Algorithms & Data Structures'),
            ('CS301', 'Web Development'),
            ('CS202', 'Object-Oriented Programming'),
            ('CS303', 'Databases'),
            ('CS204', 'Computer Networks'),
            ('CS401', 'Software Engineering'),
        ]
        mods = {}
        for code, name in MODULE_DEFS:
            m, _ = Module.objects.get_or_create(code=code, defaults={'name': name})
            mods[code] = m
        w(f'  Modules ready ({len(mods)})')

        # ── 3. Questions by Yanis ────────────────────────────────────────────────
        Q_DATA = [
            (
                'CS201',
                'What is the time complexity of Quicksort in the worst case and how to avoid it?',
                (
                    'I understand that Quicksort has an average-case of O(n log n), but the worst case is O(n²). '
                    'When exactly does this happen, and what are the common strategies to avoid it in practice? '
                    'Does choosing a random pivot always solve the problem?'
                ),
            ),
            (
                'CS301',
                'How does useEffect cleanup work in React and when exactly is it called?',
                (
                    "I'm confused about the cleanup function returned from useEffect. I know it runs before the "
                    "component unmounts, but does it also run between re-renders? For example if my dependency "
                    "array contains a value that changes, does cleanup run before the next effect fires?"
                ),
            ),
            (
                'CS303',
                'INNER JOIN vs LEFT JOIN — when should I use each one?',
                (
                    'I always struggle deciding between INNER JOIN and LEFT JOIN. Could someone explain with a '
                    'concrete example the difference in the result sets they produce? Also, does using LEFT JOIN '
                    'always carry a performance cost compared to INNER JOIN?'
                ),
            ),
            (
                'CS204',
                'What happens during a TCP three-way handshake and why is it necessary?',
                (
                    "I'm studying transport-layer protocols and trying to understand the TCP handshake deeply. "
                    "I know the steps are SYN → SYN-ACK → ACK, but why are all three messages necessary? "
                    "Couldn't we establish the connection with just two?"
                ),
            ),
            (
                'CS401',
                'What is the practical difference between unit tests and integration tests for a REST API?',
                (
                    "I'm setting up a test suite for a Django REST API and I'm not sure where to draw the line. "
                    "Should I mock the database in unit tests? What level of isolation is actually recommended "
                    "for a backend API project?"
                ),
            ),
        ]

        questions = []
        for code, title, desc in Q_DATA:
            q, _ = Question.objects.get_or_create(
                title=title,
                defaults={'description': desc, 'module': mods[code], 'author': yanis},
            )
            questions.append(q)
        w(f'  Questions ready ({len(questions)})')

        # ── 4. Answers + Notifications ───────────────────────────────────────────
        A_DATA = [
            (
                questions[0],  # Quicksort
                (
                    'The worst case hits when the pivot is always the smallest or largest element — '
                    'this happens on already-sorted or reverse-sorted input if you always pick the '
                    'first/last element as pivot.\n\n'
                    'Common mitigations:\n'
                    '1. **Random pivot** — astronomically unlikely to keep hitting the worst case.\n'
                    '2. **Median-of-three** — use the median of first, middle, last. Good in practice.\n'
                    '3. **Introsort** — what most standard libraries use: starts as Quicksort and falls '
                    'back to Heapsort if recursion depth exceeds O(log n).\n\n'
                    'Random pivot is sufficient for the vast majority of real-world inputs.'
                ),
            ),
            (
                questions[1],  # useEffect
                (
                    'Yes — cleanup runs both on unmount **and** between re-renders whenever dependencies change.\n\n'
                    'The sequence is:\n'
                    '1. Render\n'
                    '2. Effect fires (after paint)\n'
                    '3. Dependency changes → cleanup of the *previous* effect runs first\n'
                    '4. New effect fires\n'
                    '5. Unmount → final cleanup\n\n'
                    'This matters a lot for subscriptions and timers. Forgetting the cleanup creates '
                    'a new interval on every re-render without clearing the old ones:\n\n'
                    '```js\n'
                    'useEffect(() => {\n'
                    '  const id = setInterval(tick, 1000)\n'
                    '  return () => clearInterval(id)\n'
                    '}, [dependency])\n'
                    '```'
                ),
            ),
        ]

        answers = []
        for q, content in A_DATA:
            a, created = Answer.objects.get_or_create(
                question=q, author=meriem, defaults={'content': content}
            )
            answers.append(a)
            if created:
                Notification.objects.get_or_create(
                    user=yanis,
                    message=f'Merième answered your question: {q.title[:60]}',
                    question=q,
                    defaults={'is_read': False},
                )
        w(f'  Answers + notifications ready ({len(answers)})')

        # ── 5. Votes ─────────────────────────────────────────────────────────────
        q_voters = [meriem, amine, lina, rayan]   # vote on Yanis's questions
        a_voters = [yanis,  amine, lina, rayan]   # vote on Merième's answers

        for q in questions:
            for voter in q_voters:
                QuestionVote.objects.get_or_create(question=q, user=voter, defaults={'value': 1})

        for a in answers:
            for voter in a_voters:
                AnswerVote.objects.get_or_create(answer=a, user=voter, defaults={'value': 1})

        w('  Votes ready')

        # ── 6. Study session ─────────────────────────────────────────────────────
        tomorrow = date.today() + timedelta(days=1)
        session, created = StudySession.objects.get_or_create(
            module=mods['CS301'],
            chapter='React Hooks',
            date=tomorrow,
            defaults={
                'time_slot': '14:00 - 16:00',
                'max_participants': 4,
                'creator': yanis,
                'status': 'upcoming',
            },
        )
        session.participants.add(yanis)
        w(f'  Session {"created" if created else "already exists"}: {session}')

        self.stdout.write(self.style.SUCCESS('\nDemo data seeded successfully.'))

    # ── helpers ──────────────────────────────────────────────────────────────────
    def _get_or_create_user(self, email, first_name, password):
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': email, 'first_name': first_name},
        )
        if created:
            user.set_password(password)
            user.save()
        return user
