from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Grant admin privileges to a user by email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to promote')

    def handle(self, *args, **options):
        email = options['email']
        try:
            user = User.objects.get(email=email)
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'"{user.first_name or user.username}" ({email}) is now an admin.'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'No user found with email: {email}'))
