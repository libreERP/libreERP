from git import Repo
import os

dirName = os.path.dirname(os.path.abspath(__file__))
Repo.clone_from('git@goryd.in:testing' , dirName)
