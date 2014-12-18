# Initialize development environment

This project is based on Ubuntu 14.04 and official QGIS community repository.
At the moment it's best to use to use a container or a virtual machine for
development.

On a clean Ubuntu 14.04 (trusty), add QGIS community repository:

```
gpg --keyserver keyserver.ubuntu.com --recv DD45F6C3
gpg --export --armor DD45F6C3 | apt-key add -

printf "deb http://qgis.org/debian trusty main\ndeb-src http://qgis.org/debian trusty main\n" > /etc/apt/sources.list.d/qgis.list

apt-get update
```

Then install packages from the repository:

```
apt-get install vim qgis qgis-server python-pip libpq-dev libpython-dev git curl
```


# Getting started

After forking and cloning the repository, everything else is pretty much
standard for every Python Django project.

However, as QGIS Python binding can't be installed in the *virtualenv*, you
can either create one using `--system-site-packages` or simply install
everything directly on the system. If you are using a container or a virtual
machine this should not be a problem.

```
pip install -r REQUIREMENTS-dev.txt
nodeenv -n 0.10.33 -v
npm install -g grunt-cli
```

Then `cd django_project` and install JS/CSS development utilties:

```
npm install .
```


It's probably best to simply copy another developer's specific settings and
customize it to your liking.

```
cp core/settings/dev_dodobas.py core/settings/dev_username.py
```

You also need to generate JS and CSS resources by using *grunt* JS task runner:

```
grunt
```

## Development server

QGIS is based on QT framework and as such it's not really friendly towards
Python threads (GIL). To work around these issues we need to execute it in a
single thread environment. This also applies to the deployment environment.

```
export DJANGO_SETTINGS_MODULE=core.settings.dev_username
python manage.py runserver 0.0.0.0:8000 --nothreading
```

## Running tests

Tests are executed in the *production like* environment. Create your own
developer specific settings and customize to it to your liking.

```
cp core/settings/test_dodobas.py core/settings/test_username.py
```

We also need to aggregate and optimize static files:

```
python manage.py collectstatic --settings=core.settings.test_username --noinput
```

And then you can simply run test by executing `test.bash` in django_project
directory:

```
USER=username ./test.bash
```
