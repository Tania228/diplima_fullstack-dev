def serialize_file(stored, request):
    return {
        'id': stored.id,
        'original_name': stored.original_name,
        'comment': stored.comment,
        'size': stored.size,
        'uploaded_at': stored.uploaded_at.isoformat(),
        'last_downloaded_at': stored.last_downloaded_at.isoformat() if stored.last_downloaded_at else None,
        'public_url': request.build_absolute_uri(stored.public_link),
    }


def serialize_storage(owner, files, request):
    return {
        'owner': {
            'id': owner.id,
            'login': owner.login,
            'full_name': owner.full_name,
        },
        'files_count': len(files),
        'files_size': sum(item.size for item in files),
        'files': [serialize_file(item, request) for item in files],
    }
