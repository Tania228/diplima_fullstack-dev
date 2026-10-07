def serialize_user(user, include_storage=False):
    data = {
        'id': user.id,
        'login': user.login,
        'full_name': user.full_name,
        'email': user.email,
        'is_admin': user.is_admin,
    }
    if include_storage:
        data['files_count'] = user.files_count
        data['files_size'] = user.files_size or 0
    return data
