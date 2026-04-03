FROM python:3.12-slim

WORKDIR /app

COPY index.html ./index.html
COPY assets ./assets
COPY data ./data

EXPOSE 8000

CMD ["python", "-m", "http.server", "8000", "--bind", "0.0.0.0"]