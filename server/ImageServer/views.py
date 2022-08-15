from django.middleware.csrf import get_token
from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout

import rest_framework.views as RestViews
import rest_framework.parsers as RestParsers
from rest_framework.response import Response

import os
from pathlib import Path
BASE_DIR = str(Path(__file__).resolve().parent.parent)
import json
import base64

from . import models

import numpy as np

class Authenticate(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        try:
            user = authenticate(request, email=request.data["Username"], password=request.data["Password"])
            if user is not None:
                login(request, user)
                return Response(status=200, data={
                    "isAdmin": request.user.is_admin,
                    "username": request.user.email
                })
            else:
                return Response(status=403)

        except Exception as e:
            return Response(status=403)

class Logout(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        if request.user.is_authenticated:
            logout(request)
            
        return Response(status=200)

class VerifyAuthentication(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]
    
    def post(self, request):
        if request.user.is_authenticated:
            return Response(status=200, data={
                "isAdmin": request.user.is_admin,
                "username": request.user.email
            })
        else:
            return Response(status=403)

class ListDirectories(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        directories = os.listdir(BASE_DIR + '/resources/')
        availableDirectories = []
        for folder in directories:
            if folder == "." or folder == "..":
                continue
            
            if folder == "Electrodes":
                if not request.user.is_authenticated:
                    continue

                if not request.user.is_admin:
                    continue
                        
            availableDirectories.append(folder)

        return Response(status=200, data=availableDirectories)

class ListModels(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        files = os.listdir(BASE_DIR + '/resources/' + request.data["Directory"])
        availableModels = []
        for file in files:
            if file.endswith(".stl"):
                availableModels.append({
                    "file": file,
                    "type": "stl",
                    "mode": "single"
                })

            elif file.endswith(".pts"):
                if file.replace(".pts",".edge") in files:
                    availableModels.append({
                        "file": file,
                        "type": "tract",
                        "mode": "single"
                    })

        if not request.data["Directory"] == "Electrodes":
            electrodes = os.listdir(BASE_DIR + '/resources/' + "Electrodes")
            for file in electrodes:
                if file.endswith("_contacts.stl"):
                    if file.replace("_contacts.stl","_shaft.stl") in electrodes:
                        availableModels.append({
                            "file": file.replace("_contacts.stl", "_ElectrodeModel"),
                            "type": "electrode",
                            "mode": "multiple"
                        })

        return Response(status=200, data=availableModels)

class GetModels(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        if request.data["FileMode"] == "single":
            if request.data["FileType"] == "stl":
                with open(BASE_DIR + '/resources/' + request.data["Directory"] + '/' + request.data["FileName"], "rb") as file:
                    file_data = bytearray(file.read())
                colorHeader = bytes("COLOR=","ascii")
                colorArray = bytearray(colorHeader)
                
                try:
                    color = request.session["Configurations"][request.data["Directory"]][request.data["FileName"]]["Color"]
                    for i in range(3):
                        colorArray.append(int("0x" + color[i*2+1:(i+1)*2+1], base=16))
                    colorArray.append(255)

                except Exception as e:
                    color = "#FFFFFF"
                    for i in range(3):
                        colorArray.append(int("0x" + color[i*2+1:(i+1)*2+1], base=16))
                    colorArray.append(255)
                    
                colorFound = False
                lastDataByte = 0
                for i in range(80):
                    if file_data[i:i+6] == bytes("COLOR=","ascii"):
                        colorFound = True
                        lastDataByte = i-1
                    
                    if not colorFound:
                        if file_data[i] != 0x00:
                            lastDataByte = i
                
                if not colorFound:
                    file_data[lastDataByte + 1 : lastDataByte + len(colorArray) + 1] = colorArray

                return HttpResponse(bytes(file_data), status=200, headers={
                    "Content-Type": "application/octet-stream"
                })

            elif request.data["FileType"] == "tract":
                pts = np.loadtxt(BASE_DIR + '/resources/' + request.data["Directory"] + '/' + request.data["FileName"])
                edges = np.loadtxt(BASE_DIR + '/resources/' + request.data["Directory"] + '/' + request.data["FileName"].replace(".pts",".edge"), dtype=int)
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

        elif request.data["FileMode"] == "multiple":
            if request.data["FileType"] == "electrode":
                pages = []
                electrodes = os.listdir(BASE_DIR + '/resources/' + "Electrodes")
                for file in electrodes:
                    if file.startswith(request.data["FileName"].replace("_ElectrodeModel","")):
                        pages.append({
                            "filename": file,
                            "directory": "Electrodes",
                            "type": "stl"
                        })
                return Response(status=200, data=pages)

        return Response(status=200)

class UploadModels(RestViews.APIView):
    parser_classes = [RestParsers.FormParser, RestParsers.MultiPartParser]

    def post(self, request):
        if request.user.is_authenticated:
            if request.user.is_admin:
                if "file" in request.data:
                    files = request.FILES.getlist('file')
                    for file in files:
                        with open(BASE_DIR + '/resources/' + request.data["Directory"] + '/' + file.name, "wb+") as saveFile:
                            saveFile.write(file.read())
                    return Response(status=200)

                elif "NewDirectory" in request.data and not "/" in request.data["Directory"]:
                    os.makedirs(BASE_DIR + '/resources/' + request.data["Directory"], exist_ok=True)
                    return Response(status=200)

        return Response(status=404)

class DeleteModel(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        if request.user.is_authenticated:
            if request.user.is_admin:
                directories = os.listdir(BASE_DIR + '/resources/')
                if request.data["Directory"] in directories:
                    files = os.listdir(BASE_DIR + '/resources/' + request.data["Directory"])
                    if request.data["FileName"] in files:
                        os.remove(BASE_DIR + '/resources/' + request.data["Directory"] + '/' + request.data["FileName"])
                        if request.data["FileName"].endswith(".pts"):
                            os.remove(BASE_DIR + '/resources/' + request.data["Directory"] + '/' + request.data["FileName"].replace(".pts",".edge"))
                        return Response(status=200)
        return Response(status=403)

class DeleteDirectory(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        if request.user.is_authenticated:
            if request.user.is_admin:
                directories = os.listdir(BASE_DIR + '/resources/')
                if request.data["Directory"] in directories:
                    try:
                        os.rmdir(BASE_DIR + '/resources/' + request.data["Directory"])
                        return Response(status=200)
                    except:
                        pass
        return Response(status=403)

class SyncConfigurations(RestViews.APIView):
    parser_classes = [RestParsers.JSONParser]

    def post(self, request):
        if not "Configurations" in request.session:
            request.session["Configurations"] = {}
            request.session.modified = True

        if not "SetConfiguration" in request.data.keys():
            return Response(status=200, data=request.session["Configurations"])

        else:
            if not request.data["Directory"] in request.session["Configurations"].keys():
                request.session["Configurations"][request.data["Directory"]] = {}
            if not request.data["FileName"] in request.session["Configurations"][request.data["Directory"]].keys():
                request.session["Configurations"][request.data["Directory"]][request.data["FileName"]] = {}
            
            request.session["Configurations"][request.data["Directory"]][request.data["FileName"]][request.data["Type"]] = request.data["Value"]
            request.session.modified = True
            return Response(status=200)
