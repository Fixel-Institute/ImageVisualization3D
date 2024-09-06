FROM ubuntu/nginx:1.18-20.04_beta

WORKDIR /usr/src/ImageViewer
COPY ./client/build /usr/share/nginx/html
COPY ./server/nginx.conf /etc/nginx/sites-enabled/default

COPY ./server .

RUN apt-get update && \
    apt-get install python3 python3-pip libjpeg-dev libjpeg8-dev libpng-dev libmysqlclient-dev -y && \
    pip3 install django djangorestframework numpy scipy pandas nibabel

EXPOSE 80
EXPOSE 443
EXPOSE 3001

CMD ["bash"]
