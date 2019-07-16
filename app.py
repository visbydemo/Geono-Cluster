



from time import sleep
import os
import copy
from flask_socketio import SocketIO, send, emit
import pandas as pd
from flask import Flask, render_template, jsonify
from flask import request
from sklearn import svm
import random
import simplejson as json
import ast
import itertools
import numpy as np
from sklearn.model_selection import cross_val_score
import timeit
from timeit import default_timer as timer
from sklearn.model_selection import train_test_split
from clustering import get_clustering



from Queue import Queue
from threading import Thread

class Unbuffered(object):
    	def __init__(self, stream):
		self.stream = stream
	def write(self, data):
		self.stream.write(data)
		self.stream.flush()
	def writelines(self, datas):
		self.stream.writelines(datas)
		self.stream.flush()
	def __getattr__(self, attr):
		return getattr(self.stream, attr)



import sys
import gc
sys.stdout.flush()
sys.stdout = Unbuffered(sys.stdout)
	
# for socketio
# import eventlet
# eventlet.monkey_patch()
app = Flask(__name__)
socketio = SocketIO(app)
# socketio = SocketIO(app,async_mode='eventlet')



def disable_stdout_buffering():
    # Appending to gc.garbage is a way to stop an object from being
    # destroyed.  If the old sys.stdout is ever collected, it will
    # close() stdout, which is not good.
    gc.garbage.append(sys.stdout)
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 0)


# Then this will give output in the correct order:
# disable_stdout_buffering()







def preprocess_data(dataGiven):
	# print "preprocessing in python ", len(dataIn)

	dataIn = dataGiven['data']
	# targetCol = dataGiven['targetName']
	inp_df = pd.DataFrame(dataIn)
	inp_df['cluster'] = 0
	orig_df = inp_df.fillna(0)
	v = 20*7
	inp_df = orig_df[0:v]
	app_df = orig_df[v:orig_df.shape[0] - 1]
	app_df['id'] = [i for i in range(app_df.shape[0])]
	inp_df['id'] = [i for i in range(inp_df.shape[0])]
	train, test = train_test_split(inp_df, test_size=0.15)
	# print " after split ", train.shape, test.shape

	# train_Y = train.ix[:, [targetCol]]
	# test_Y = test.ix[:, [targetCol]]

	# train_X = train.drop([targetCol], axis=1)
	# test_X = test.drop([targetCol], axis=1)
	# app_df = app_df.drop([targetCol], axis=1)

	app_df_dict = app_df.to_dict('records')
	train_X_dict = train.to_dict('records')
	test_X_dict = test.to_dict('records')
	# train_Y_dict = train_Y.to_dict('records')
	# test_Y_dict = test_Y.to_dict('records')
	# return [train_X_dict, train_Y_dict, test_X_dict, test_Y_dict, app_df_dict]
	return [train_X_dict, test_X_dict, app_df_dict]






# @app.route("/", methods=['GET', 'POST'])
# @app.route('/index', methods=['GET', 'POST'])
@app.route("/")
def index():
	return render_template('index.html')




# socket func+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
@socketio.on('client_connected')
def handle_client_connect_event(json):
    print('received json: {0}'.format(str(json)))


@socketio.on('data_preprocess')
def handle_my_custom_event(data):
	out = preprocess_data(data)
	emit('data_return_preprocess', out)


@socketio.on('find_clustering')
def handle_my_custom_event(data):
	print " gotten item ++++++++++++++++++++++++++++++++++++++++++ ", data['id']
	out = get_clustering(data)
	obj = {}
	obj['id'] = data['id']
	# print " num cluseters and cluster len ", int(data['numClusters']), int(data['clusterLen'])
	obj['numClusters'] = int(data['numClusters']) + int(data['clusterLen'])
	obj['data'] = out['data']
	cenDf = pd.DataFrame(out['cluster_cen'])

	# print "cen df is ", cenDf
	print "numcluster sneding ", obj['numClusters'],  int(data['numClusters']), int(data['clusterLen'])
	obj['clusterCen'] = cenDf.to_json()
	obj['colHeaders'] = json.dumps(out['col_headers'].tolist())
	# print " we get out ", obj['id'], obj['numClusters']
	# print " we getting data now ", out
	emit('on_clustering_recieve'+str(obj['id']), obj)
	# socketio.removeListener('on_clustering_recieve')


@socketio.on('find_recommend')
def handle_my_custom_event(data):
	out = get_clustering(data)
	# print " we get out ", out
	emit('on_recommend_recieve', out)

# socket func+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


if __name__ == "__main__":
    	
	import warnings
	warnings.filterwarnings("ignore")	

	# app.debug = True
	# port = int(os.environ.get("PORT", 7000))
	# app.run(host = '0.0.0.0', port = port)
	# socketio.run(app, 7000)
	# socketio.run(app, host='localhost', port=7000)
	# socketio.run(app, debug=True)
	socketio.run(app)