from django.middleware.csrf import get_token
from django.http import HttpResponse

import rest_framework.views as RestViews
import rest_framework.parsers as RestParsers
from rest_framework.response import Response

import os
from pathlib import Path
BASE_DIR = str(Path(__file__).resolve().parent.parent)
import json

import numpy as np

class ListModels(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        tform = json.loads(request.body)
        files = os.listdir(BASE_DIR + '/resources/' + tform["Directory"])

        availableModels = []
        for file in files:
            if file.endswith(".stl"):
                availableModels.append(file)
            elif file.endswith(".pts"):
                if file.replace(".pts",".edge") in files:
                    availableModels.append(file)

        return Response(status=200, data=availableModels)

class GetModels(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        tform = json.loads(request.body)
        with open(BASE_DIR + '/resources/' + tform["Directory"] + '/' + tform["FileName"], "rb") as file:
            file_data = file.read()
        
        return HttpResponse(file_data, status=200, headers={
            'Content-Type': 'application/octet-stream',
        })

class GetTracts(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        tform = json.loads(request.body)

        pts = np.loadtxt(BASE_DIR + '/resources/' + tform["Directory"] + '/' + tform["FileName"])
        edges = np.loadtxt(BASE_DIR + '/resources/' + tform["Directory"] + '/' + tform["FileName"].replace(".pts",".edge"), dtype=int)
        tracts = []
        breakingIndex = np.where(np.diff(edges[:,0]) != 1)[0]

        startIndex = 0
        for i in range(len(breakingIndex)):
            if i > 0:
                startIndex = edges[breakingIndex[i-1]+1,0]
            endIndex = edges[breakingIndex[i],1]+1
            tracts.append(pts[startIndex:endIndex])

        return Response(status=200, data={
            "points": tracts
        })

class SyncConfigurations(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        if len(request.body) > 0:
            tform = json.loads(request.body)
        else:
            tform = {}
            
        if not "Configurations" in request.session:
            request.session["Configurations"] = {}
            request.session.modified = True

        if not "SetConfiguration" in tform.keys():
            return Response(status=200, data=request.session["Configurations"])

        else:
            request.session["Configurations"][tform["SetConfiguration"]] = tform["Configuration"]
            request.session.modified = True
            return Response(status=200)
