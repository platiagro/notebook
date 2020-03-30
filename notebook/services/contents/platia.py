"""
Classes for PlatIa components.
"""
import os
import requests

from minio import Minio

def save_component_on_minio(self, path, os_path):
    minioHost = os.getenv('MINIO_HOST', 'minio-service.kubeflow:9000')
    minioAccessKey = os.getenv('MINIO_ACCESS_KEY', 'minio')
    minioSecretKey = os.getenv('MINIO_SECRET_KEY', 'minio123')
    minioBucket = os.getenv('MINIO_BUCKET', 'anonymous')
    minioClient = Minio(minioHost, access_key=minioAccessKey, secret_key=minioSecretKey, secure=False)
    try:
        bucketExists = minioClient.bucket_exists(minioBucket)
        if not bucketExists:
            minioClient.make_bucket(minioBucket, location="us-east-1")
        minioClient.fput_object(minioBucket, path, os_path)
    except Exception as e:
        self.log.error(u'Error while saving file on Minio: %s', e)

def upload_dataset(self, file):
    dataset_endpoint = os.getenv("DATASET_ENDPOINT", "http://datasets.kubeflow:8080/datasets")
    files = {'file': file}
    r = requests.post(dataset_endpoint, files=files)
    if r.status_code != requests.codes.ok:
        return
    return r.json()