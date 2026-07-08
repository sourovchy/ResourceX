import os

def generate_tree(dir_path, ignore_dirs, prefix=""):
    try:
        items = os.listdir(dir_path)
    except PermissionError:
        return []
        
    items = [i for i in items if i not in ignore_dirs and not i.startswith('.')]
    items.sort(key=lambda x: (os.path.isfile(os.path.join(dir_path, x)), x))
    
    lines = []
    for i, item in enumerate(items):
        is_last = i == (len(items) - 1)
        connector = "`-- " if is_last else "|-- "
        lines.append(f"{prefix}{connector}{item}{'/' if os.path.isdir(os.path.join(dir_path, item)) else ''}")
        
        if os.path.isdir(os.path.join(dir_path, item)):
            new_prefix = prefix + ("    " if is_last else "|   ")
            lines.extend(generate_tree(os.path.join(dir_path, item), ignore_dirs, new_prefix))
            
    return lines

ignore = {'node_modules', '.git', '.next', 'dist', 'build', 'target', '.idea', '__pycache__', 'target'}

backend_tree = generate_tree("backend", ignore)
frontend_tree = generate_tree("frontend", ignore)
db_tree = generate_tree("database", ignore)

print("Backend:")
print("backend/")
print("\n".join(backend_tree))

print("\nFrontend:")
print("frontend/")
print("\n".join(frontend_tree))

print("\nDatabase:")
print("database/")
print("\n".join(db_tree))
