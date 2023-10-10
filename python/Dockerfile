FROM python:3.12-slim-bookworm

WORKDIR /home/python/app/

ADD requirements.txt .
RUN pip3 install -r requirements.txt 

RUN mkdir src
ADD src/generate_stars.py ./src