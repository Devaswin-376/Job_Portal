import django_filters
from .models import JobPost

class JobFilter(django_filters.FilterSet):
    salary_min = django_filters.NumberFilter(field_name="salary", lookup_expr='gte')
    salary_max = django_filters.NumberFilter(field_name="salary", lookup_expr='lte')
    location = django_filters.CharFilter(field_name="location", lookup_expr='icontains')
    designation = django_filters.CharFilter(field_name="title", lookup_expr='icontains')
    experience = django_filters.CharFilter(field_name="experience", lookup_expr='icontains')
    job_type = django_filters.ChoiceFilter(choices=JobPost.JOB_TYPES)
    company_name = django_filters.CharFilter(field_name="company_name",lookup_expr='icontains')
    posted_after = django_filters.DateFilter(field_name="created_at", lookup_expr='gte')
    
    class Meta:
        model = JobPost
        fields = ['salary','location','experience','job_type','company_name']
