const Redis = require('ioredis')

const redis = new Redis({
    port: 10544,
    host: "redis-10544.c1.ap-southeast-1-1.ec2.redns.redis-cloud.com",
    password: process.env.PASSWORD_REDIS
  
  });


module.exports = redis