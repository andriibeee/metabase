git reset HEAD~1
rm ./backport.sh
git cherry-pick 61849910e861c380ff1fa4e27281532511dcb6e6
echo 'Resolve conflicts and force push this branch'
