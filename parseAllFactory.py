#!/usr/bin/python

import json
import os

dir = "../factorydata/"
data = {}

for subdir, dirs, files in os.walk(dir):
	for file in files:
		extension = os.path.splitext(file)[1][1:]
		relativePath = dir + file
		print(relativePath)
		if(extension != "png"):
			with open(relativePath, encoding="utf8") as json_target:
				targetData = json.load(json_target)
				if extension not in data:
					data[extension] = []
				data[extension].append(targetData)


for key in data:
	with open("jsonfactory/" + key + ".json", "w") as outfile:
		json.dump(data[key], outfile)
