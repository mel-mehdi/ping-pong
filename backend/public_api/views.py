from django.shortcuts import render
from django.http import JsonResponse

def testing_view(request):
	return JsonResponse({"message": "Public API is working!"})
