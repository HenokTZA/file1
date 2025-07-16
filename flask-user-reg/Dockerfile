# flask-user-reg/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy your application code
COPY . .

# tell Flask to listen on 0.0.0.0
# Betty Made 8500, not sure why - revert if needed
ENV FLASK_APP=app.py \
    FLASK_ENV=development \
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_RUN_PORT=8000


# start the dev server (for production, swap to gunicorn)
CMD ["flask", "run"]
