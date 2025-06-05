from django.contrib import admin
from .models import Perfil, UserProfile # Importe seus modelos

# Registre o modelo Perfil
@admin.register(Perfil) # CORRIGIDO AQUI: Registra o modelo Perfil
class PerfilAdmin(admin.ModelAdmin): # CORRIGIDO AQUI: Nome da classe para Perfil
    list_display = ('id', 'nome', 'descricao') # CORRIGIDO AQUI: Campos do modelo Perfil
    search_fields = ('nome',)
    list_per_page = 25

# Registre o modelo UserProfile
@admin.register(UserProfile) # CORRETO: Registra o modelo UserProfile
class UserProfileAdmin(admin.ModelAdmin): # CORRETO: Nome da classe para UserProfile
    list_display = ('id', 'user', 'get_user_email', 'perfil') # Mantive sua configuração com 'id' e 'get_user_email'
    list_select_related = ('user', 'perfil') # Bom para otimizar queries
    list_filter = ('perfil',)
    search_fields = ('user__username', 'user__email')
    raw_id_fields = ('user', 'perfil')
    list_per_page = 25

    def get_user_email(self, obj):
        # Esta função pertence ao UserProfileAdmin, pois acessa obj.user.email
        return obj.user.email
    get_user_email.short_description = 'Email do Usuário' # Define o nome da coluna no admin

# As linhas abaixo devem permanecer comentadas, pois já estamos usando @admin.register:
# # Alternativamente, a forma mais simples de registrar (sem customizações na listagem):
# # admin.site.register(Perfil)
# # admin.site.register(UserProfile)