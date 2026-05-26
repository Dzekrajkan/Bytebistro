from django.contrib.auth import get_user_model

User = get_user_model()

def create_user(username, email, role, password):
    user = User(
        username=username,
        email=email,
        role=role
    )

    user.set_password(password)
    user.save()

    return user