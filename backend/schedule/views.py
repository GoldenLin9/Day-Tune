from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from users.models import User
from .serializers import TimeBlockSerializer, CategorySerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import TimeBlock, Category
from datetime import datetime, date
from rest_framework import status
from django.shortcuts import get_object_or_404
# Create your views here.

class Node:

    def __init__(self, id, parent_index, start_time, end_time, categoryId, color, description, name):
        self.id = id
        self.parent_index = parent_index

        self.start_time = start_time
        self.end_time = end_time

        self.categoryId = categoryId
        self.color = color
        self.description = description
        self.name = name

        self.children = []
        self.index = None

    def __str__(self):
        return f"{self.start_time} - {self.end_time} - {self.name}: {self.id}"


# update children's array for an undiscovered branch
def updateChildrens(node, nodes, visited):
    # no parent for the root node
    if node.parent_index == None:
        return

    
    parent = nodes[node.parent_index]
    parent.children.append(node)

    # keep going up the tree if the parent is not the root or a discovered branch
    if not visited[parent.index]:
        updateChildrens(parent, nodes, visited)

    visited[node.index] = True
    
def convertToJSON(node):

    children = []
    for child in node.children:
        children.append(convertToJSON(child))

    return {
        "id": node.id,
        "start_time": node.start_time,
        "end_time": node.end_time,
        "categoryId": node.categoryId,
        "color": node.color,
        "description": node.description,
        "name": node.name,
        "children_count": len(children),
        "children": children
    }


class TimeBlockView(APIView):

    def get(self, request, date_str):
        # sort time blocks to make sure childrens get added from earliest to latest
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format"}, status=400)
        
        time_blocks = TimeBlock.objects.filter(user = request.user, date = date)
        times_blocks = sorted(time_blocks, key = lambda time_block: time_block.end_time)

        time_blocks_size = len(times_blocks)
        visited = [False] * (time_blocks_size + 1)

        index_mappings = { time_block.id: index for (index, time_block) in enumerate(times_blocks) }
        index_mappings[-1] = time_blocks_size

        root_time = Node(None, None, None, None, None, None, None, None)
        root_time.index = time_blocks_size
        times = []
        for (index, time_block) in enumerate(times_blocks):

            category = time_block.category

            parent_id = time_block.parent
            if parent_id == None:
                time_parent_index = time_blocks_size
            else:
                time_parent_index = index_mappings.get(parent_id.id)

            if category == None:
                time = Node(time_block.id, time_parent_index, time_block.start_time, time_block.end_time, None, None, None, None)

            else:
                time = Node(time_block.id, time_parent_index, time_block.start_time, time_block.end_time, category.id, category.color, category.description, category.name)

            time.index = index
            times.append(time)
        
        times.append(root_time)
        

        for time in times:
            if not visited[time.index]:
                updateChildrens(time, times, visited)

        data = convertToJSON(root_time)

        return Response(data, status.HTTP_200_OK)
    

    def post(self, request):

        if request.data['category_id'] == None:
            category = None
        else:
            category = get_object_or_404(Category, pk = request.data['category_id'], user = request.user)

        if request.data['parent_id'] == None:
            parent = None
        else:
            parent = get_object_or_404(TimeBlock, pk = request.data['parent_id'], user = request.user)

        try:
            date = datetime.strptime(request.data['date'], '%Y-%m-%d').date()
            start_time = datetime.strptime(request.data['start_time'], '%H:%M:%S').time()
            end_time = datetime.strptime(request.data['end_time'], '%H:%M:%S').time()

        except ValueError:
            return Response({"error": "Invalid date or time format"}, status=400)

        time_block = TimeBlock.objects.create(start_time = start_time, end_time = end_time, date = date, parent = parent, category = category, user = request.user)
        return Response(TimeBlockSerializer(time_block).data)
    

    def put(self, request):
        time_blocks = request.data['time_blocks']

        if not time_blocks:
            return Response("No time blocks provided", status.HTTP_400_BAD_REQUEST)

        time_blocks_to_update = []
        for time_block in time_blocks:

            category = get_object_or_404(Category, pk = time_block['category_id'], user = request.user)
            time = get_object_or_404(TimeBlock, pk = time_block['id'], user = request.user)
            
            time.start_time = time_block['start_time']
            time.end_time = time_block['end_time']
            time.category = category

            time_blocks_to_update.append(time)

        TimeBlock.objects.bulk_update(time_blocks_to_update, ['start_time', 'end_time', 'category'])
        return Response("Time block(s) updated", status.HTTP_200_OK)
    

    def delete(self, request):
        time_block = get_object_or_404(TimeBlock, pk = request.data['id'], user = request.user)
        time_block.delete()
        return Response(TimeBlockSerializer(time_block).data, status.HTTP_200_OK)
    

class CategoryView(APIView):

    def get(self, request, category_id):
        category = get_object_or_404(Category, pk = category_id, user = request.user)
        return Response(CategorySerializer(category).data)
        
    def post(self, request):
        category = Category.objects.create(name = request.data['name'], description = request.data['description'], color = request.data['color'], user = request.user)
        return Response(CategorySerializer(category).data)
    
    def put(self, request):
        category = get_object_or_404(Category, pk = request.data['id'], user = request.user)
        category.name = request.data['name']
        category.description = request.data['description']
        category.color = request.data['color']
        category.save()

        return Response(CategorySerializer(category).data, status.HTTP_200_OK)
    
    def delete(self, request):
        category = Category.objects.get(pk = request.data['id'], user = request.user)
        category.delete()

        return Response(CategorySerializer(category).data, status.HTTP_200_OK)