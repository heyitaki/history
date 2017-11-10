from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
from google.cloud import storage
import json

app = Flask(__name__)

def construct_ret(args, ret_text):
	return "%s(%s)" % (args.get('callback'), json.dumps(ret_text))

@app.route('/', methods=['GET', 'POST'])
def test():
  args = request.args
  return construct_ret(args, args.get('bucket'))

@app.route('/upload', methods=['GET', 'POST'])
def upload():
  args = request.args
  print 'UPLOAD ARGS: '
  print args
  bucket_name = args.get('bucket')
  destination_blob_name = args.get('dst_path')
  source_file_name = args.get('src_path')

  storage_client = storage.Client.from_service_account_json('./archer-extension-8dcc72352171.json')
  bucket = storage_client.get_bucket(bucket_name)
  blob = bucket.blob(destination_blob_name)
  blob.upload_from_filename(source_file_name)

  return construct_ret(args, 'File %s uploaded to %s.' % (source_file_name, destination_blob_name))
    
if __name__ == "__main__":
  app.run(debug=True)
