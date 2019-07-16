

from time import sleep
import os
import pandas as pd
import random
import numpy as np
import timeit
from scipy import stats
from sklearn.cluster import KMeans
from sklearn import preprocessing
from sklearn.feature_selection import VarianceThreshold
from sklearn.decomposition import PCA


def one_hot_encodeCategoricals(X, categorical):

    cols = X.columns
    X = X.apply(pd.to_numeric, errors='ignore')
    if(not categorical) : return X._get_numeric_data()
    num_cols = X._get_numeric_data().columns
    cat_cols = list(set(cols) - set(num_cols))
    X_cat = X[cat_cols]
    X_num = X[num_cols]

    le = preprocessing.LabelEncoder()
    X_2 = X_cat.apply(le.fit_transform)
    X_2.head(2), X_2.shape

    enc = preprocessing.OneHotEncoder()
    # 2. FIT
    enc.fit(X_2)
    # 3. Transform
    onehotlabels = enc.transform(X_2).toarray()
    onehotlabels_df = pd.DataFrame(onehotlabels)
    col_onehot_df = onehotlabels_df.columns

    X_num[col_onehot_df] = onehotlabels_df[col_onehot_df]
    return X_num

def user_feature_sel(data, user_wts):
    attrb = user_wts.keys()
    dropped_df = data[attrb]
    print "new attrb ", dropped_df.head(3)
    return dropped_df


def feature_selection(data):
    # print " before feature selected data ", data.shape
    numCol = data.shape[1]
    numComp = random.randint(0, data.shape[1]-2)
    data_scaled = pd.DataFrame(preprocessing.scale(data), columns=data.columns)

    # sel = VarianceThreshold(threshold=(.8 * (1 - .8)))
    # sel = VarianceThreshold(.5)
    # sel.fit_transform(data)
    sel = PCA(n_components=numCol, whiten=True).fit(data_scaled)
    pca_df = pd.DataFrame(
        sel.components_, columns=data.columns)

    summed_pca_df = pd.DataFrame(sel.components_, columns=data_scaled.columns).abs().sum(axis=0)
    summed_pca_df = summed_pca_df.to_dict()
    sorted_summed_df = sorted(summed_pca_df.items(), key=lambda x: x[1])
    sorted_summed_df.reverse()
    # print " we get components ", pca_df
    # print " we get components ", summed_pca_df
    # print " we get components ", sorted_summed_df
    data = sel.transform(data_scaled)
    # print " feature selected data shape ", data.shape
    imp_col = []
    for i in range(numComp):
        imp_col.append(sorted_summed_df[i][0])
    data_final = pd.DataFrame(
        data, columns=data_scaled.columns)
    dropped_df = data_final.drop(imp_col, 1)
    # print " main features found ", imp_col
    # print " dropped data ", data_final.head(3)
    # print " dropped data ", dropped_df.head(3)
    return dropped_df

def get_clustering(dataGiven):

    dataDict = dataGiven['data']
    num_clusters = dataGiven['numClusters']
    len_preCluster = dataGiven['clusterLen']
    user_wts = dataGiven['userWts']

    # print "found user weights ", user_wts, len(user_wts.keys())
    # print "found num_clusters ", num_clusters
    # print " got data as ", dataGiven
    # return 4523
    data = pd.DataFrame(dataDict)
    data = data.apply(pd.to_numeric, errors='ignore')

    # data = data._get_numeric_data()
    id_col = data['id']
    data = data.drop(['cluster'], axis=1)
    data = data.drop(['id'], axis=1)

    data = one_hot_encodeCategoricals(data, False)
    data.columns = data.columns.map(str)
    # ftr = [str(x) for x in train_X.columns.values]
    
    try:
        if(len(user_wts.keys()) == 0): dropped_df = feature_selection(data)
        else : dropped_df = user_feature_sel(data, user_wts)
    except:
        dropped_df = data
    # Standardize
    # print "columns gotten  ", clmns
    # return {}
    # return 34
    # clmns = ['Displacement', 'Horsepower', 'MPG', 'Model']
    # df_tr_std = stats.zscore(data[clmns])

    print "we get dropped df shape ", dropped_df.shape

    col_head_dropped = dropped_df.columns.values
    col_headers = data.columns.values
    # print " input data shape ", data.shape
    # print " input data shape ", data.head(3)
    # print " input data shape ", data.columns.values
    # Cluster the data
    kmeans = KMeans(n_clusters=num_clusters,
                    random_state=0).fit(dropped_df)  # df_tr_std # data

    # kmeans_fake = KMeans(n_clusters=num_clusters,
    #                 random_state=0).fit(data)
    labels = kmeans.labels_

    labels = [x+len_preCluster for x in labels]

    data['cluster'] = labels
    data['id'] = id_col

    res = kmeans.__dict__
    # cen = res['cluster_centers_']
    cen = kmeans.__dict__['cluster_centers_']
    cen_transp =  cen.transpose()
    den_attr_dict  = {}
    for i in range(len(col_head_dropped)):
        den_attr_dict[col_head_dropped[i]] = cen_transp[i]

    keyItem = list(den_attr_dict.keys())
    print "getting keyitem ", keyItem
    for i in range(len(col_headers)):
        # print " ++++ iter ", i, col_headers[i]
        if (col_headers[i] not in keyItem):
            # print " did not find ", col_headers[i]
            arr = [0  for m in range(num_clusters)]
            den_attr_dict[col_headers[i]] = arr
        
        



    # print "cluster center egiven shape by ", cen.shape
    # print "cluster center egiven by ", cen_transp
    # print "dropped columns ", col_head_dropped, col_headers
    # print "attr dict dropped ", den_attr_dict.keys()

    # print "we get labels aas ", labels
    # print "after kmeans clustering ", data.head(4)
    return {'data': data.to_dict('records'), 'cluster_cen': den_attr_dict, 'col_headers': col_headers}
