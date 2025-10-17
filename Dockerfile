FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y gcc libpq-dev netcat-openbsd
COPY ./requirements.txt /app/

RUN pip install -r requirements.txt

COPY . /app/
COPY ./entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000
ENTRYPOINT [ "/app/entrypoint.sh" ]

CMD gunicorn collabhub.wsgi:application --bind 0.0.0.0:$PORT