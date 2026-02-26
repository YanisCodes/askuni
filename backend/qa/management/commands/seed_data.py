from django.core.management.base import BaseCommand
from qa.models import Module, Resource


class Command(BaseCommand):
    help = 'Seed modules and resources'

    def handle(self, *args, **options):
        modules_data = [
            {"name": "Data Structures", "code": "CS201"},
            {"name": "Web Development", "code": "CS301"},
            {"name": "Database Systems", "code": "CS202"},
            {"name": "Operating Systems", "code": "CS303"},
            {"name": "Algorithms", "code": "CS204"},
            {"name": "Software Engineering", "code": "CS401"},
        ]
        for m in modules_data:
            Module.objects.get_or_create(code=m['code'], defaults={'name': m['name']})

        resources_data = [
            {"module_code": "CS201", "title": "Introduction to Algorithms", "author": "Cormen, Leiserson, Rivest, Stein", "type": "book"},
            {"module_code": "CS301", "title": "Eloquent JavaScript", "author": "Marijn Haverbeke", "type": "book"},
            {"module_code": "CS202", "title": "Database System Concepts", "author": "Silberschatz, Korth, Sudarshan", "type": "book"},
            {"module_code": "CS303", "title": "Operating System Concepts", "author": "Silberschatz, Galvin, Gagne", "type": "book"},
            {"module_code": "CS204", "title": "The Algorithm Design Manual", "author": "Steven Skiena", "type": "book"},
            {"module_code": "CS401", "title": "Clean Code", "author": "Robert C. Martin", "type": "book"},
        ]
        for r in resources_data:
            module = Module.objects.get(code=r['module_code'])
            Resource.objects.get_or_create(
                module=module, title=r['title'],
                defaults={'author': r['author'], 'type': r['type']}
            )

        self.stdout.write(self.style.SUCCESS('Seeded 6 modules and 6 resources'))
