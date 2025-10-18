#signals are used to perform certain actions automatically 
#here signals are used to create profile based on the role entered


from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User,JobSeekerProfile,EmployerProfile, CompanyProfile


#This runs after an User is saved
@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created : 
        if instance.role == "jobseeker":
            JobSeekerProfile.objects.create(user = instance)
        elif instance.role == "employer":
            EmployerProfile.objects.create(user = instance)
        elif instance.role == "company":
            CompanyProfile.objects.create(user = instance)
            
