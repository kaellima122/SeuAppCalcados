from django.db import models
from django.db import models
from django.contrib.auth.models import User # Importa o modelo de Usuário padrão do Django
from django.db.models.signals import post_save # Usaremos para criar o UserProfile automaticamente
from django.dispatch import receiver # Para o "decorator" do signal

# Modelo para os Perfis de Usuário
class Perfil(models.Model):
    nome = models.CharField(
        max_length=100,
        unique=True,
        help_text="Ex: Administrador, Gerente de Produção, Estoquista"
    )
    descricao = models.TextField(blank=True, null=True)

    def __str__(self):
        # Isso define como o objeto Perfil será exibido (ex: na interface de admin)
        return self.nome

    class Meta:
        verbose_name = "Perfil de Usuário"
        verbose_name_plural = "Perfis de Usuário"

# Modelo para estender as informações do Usuário padrão do Django
class UserProfile(models.Model):
    user = models.OneToOneField(
        User, # Liga este perfil ao modelo User do Django
        on_delete=models.CASCADE, # Se o User for deletado, o UserProfile também será
        related_name='profile' # Permite acessar o profile a partir do user (user.profile)
    )
    perfil = models.ForeignKey(
        Perfil,
        on_delete=models.SET_NULL, # Se o Perfil for deletado, o campo perfil no UserProfile fica nulo
        null=True, # Permite que o campo seja nulo no BD
        blank=True # Permite que o campo seja vazio nos formulários do Django
    )
    # Observações sobre os campos que você especificou para "Usuário":
    # - 'id': Já existe no modelo 'User' (user.id)
    # - 'nome': Pode ser coberto por 'User.first_name' e 'User.last_name'. Se precisar de um "nome completo" específico,
    #           poderia adicionar um campo aqui: nome_completo = models.CharField(max_length=255, blank=True)
    # - 'email': Já existe no modelo 'User' (user.email)
    # - 'senha_hash': O Django gerencia senhas de forma segura no modelo 'User' (user.password)
    # - 'ativo': Já existe no modelo 'User' (user.is_active)

    def __str__(self):
        return f"Perfil de {self.user.username}"

    class Meta:
        verbose_name = "Perfil Estendido do Usuário"
        verbose_name_plural = "Perfis Estendidos dos Usuários"

# Este é um "signal". Ele garante que toda vez que um objeto User for salvo (especialmente criado),
# um UserProfile correspondente seja criado ou atualizado automaticamente.
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        # Para garantir que o perfil exista se por acaso não foi criado antes
        # ou para atualizá-lo se necessário (embora aqui só estamos criando se não existir)
        UserProfile.objects.get_or_create(user=instance)
    # instance.profile.save() # Geralmente não é necessário chamar save() aqui se for só criação/get_or_create
# Create your models here.
