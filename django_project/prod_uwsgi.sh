export DJANGO_SETTINGS_MODULE=core.settings.prod_$USER

uwsgi --http 0.0.0.0:8000 --workers 4 --static-map /static=./static/ --static-map /media=./media/ --master --module core.wsgi:application
