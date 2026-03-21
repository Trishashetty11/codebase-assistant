import git
import os
import shutil
import stat

def handle_remove_readonly(func, path, exc):
    """
    Windows locks .git files as read-only.
    This forces them to be deletable.
    """
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clone_repo(repo_url: str, local_path: str = "./cloned_repo") -> str:
    if os.path.exists(local_path):
        shutil.rmtree(local_path, onexc=handle_remove_readonly)
        print(f"Deleted old clone at {local_path}")

    print(f"Cloning {repo_url} ...")
    git.Repo.clone_from(repo_url, local_path)
    print(f"Cloned successfully to {local_path}")
    return local_path