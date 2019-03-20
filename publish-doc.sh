#!/bin/bash

# Formn doc and GitHub Pages.
rm -rf formn-doc
rm -rf benbotto.github.io
git clone git@github.com:benbotto/formn-doc.git
git clone git@github.com:benbotto/benbotto.github.io.git

# Update the api-doc to the lastest.
npm run doc

rm -rf formn-doc/api-doc/latest/*
cp -R doc/* formn-doc/api-doc/latest/

cd formn-doc
git add -A
git commit -m "Updates api-doc."
git push
git checkout master
git merge develop -m "Merge branch develop."
git push

# Build the jekyl site for the formn-doc.
docker-compose -f ./docker-compose.build.yml up

cd ..

# Update Pages.
mkdir -p benbotto.github.io/doc/formn/5.x.x
rm -rf benbotto.github.io/doc/formn/5.x.x/*
cp -R formn-doc/_site/* benbotto.github.io/doc/formn/5.x.x/
cd benbotto.github.io
git add -A
git commit -m "Updates formn-doc."
git push
cd ..

# Cleanup.
rm -rf formn-doc
rm -rf benbotto.github.io
