aws ecr get-login-password --profile cashcow --region ap-northeast-2 | docker login --username AWS --password-stdin 912305628761.dkr.ecr.ap-northeast-2.amazonaws.com

docker buildx build --platform linux/amd64 -t crawling-bot .

docker tag crawling-bot:latest 912305628761.dkr.ecr.ap-northeast-2.amazonaws.com/crawling-bot:latest

docker push 912305628761.dkr.ecr.ap-northeast-2.amazonaws.com/crawling-bot:latest
