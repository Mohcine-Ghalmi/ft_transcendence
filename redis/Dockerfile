FROM debian:bullseye

RUN apt update && apt install -y redis-server && apt clean && \
    rm -rf /var/lib/apt/lists/*

COPY conf/redis.sh /usr/local/bin/redis.sh
COPY tools/showdata.sh /usr/local/bin/showdata.sh

RUN chmod +x /usr/local/bin/redis.sh
RUN chmod +x /usr/local/bin/showdata.sh

EXPOSE 6379

CMD ["/usr/local/bin/redis.sh"]
