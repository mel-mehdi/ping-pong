FROM python:3.14-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1
# Disable writing .pyc files
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
	build-essential \
	gcc \
	netcat-openbsd \ 
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY ./entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY . /app

EXPOSE 8001

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
