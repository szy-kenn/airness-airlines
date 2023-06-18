from src import celery, skyscanner

celery.task(skyscanner.async_request)

if __name__ == '__main__':
    celery.worker_main(['worker', '--loglevel=info', '--pool=solo'])