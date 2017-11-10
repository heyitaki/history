from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
from google.cloud import storage
import json

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def hello():
  print 'start hello'
  print request
  print request.args
  ret = request.args.get('bucket')
  if ret is None:
    ret = 'Nonekjkjkjk'
  print '================='
  ret = "%s(%s)" % (request.args.get('callback'), json.dumps(ret))
  print ret
  return ret

@app.route('/upload', methods=['GET', 'POST'])
def upload():
  if request.method == 'POST':
    args = request.args
    bucket_name = args.get('bucket')
    destination_blob_name = args.get('dst_path')
    source_file_name = args.get('src_path')

    storage_client = storage.Client.from_service_account_json('archer-extension-98b1c9cc14cb.json')
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(source_file_name)

    return 'File {} uploaded to {}.'.format(source_file_name, destination_blob_name)
    
if __name__ == "__main__":
  app.run(debug=True)
