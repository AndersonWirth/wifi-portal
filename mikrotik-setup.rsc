# ============================================================
# SCRIPT DE CONFIGURAÇÃO MIKROTIK HOTSPOT
# Wi-Fi Portal SaaS
#
# Execute via: Winbox > New Terminal  (cole linha por linha)
# ou via SSH: ssh admin@192.168.88.1
# ============================================================

# --------------------------------------------------
# 1. WALLED GARDEN
# Permite acesso ao portal ANTES do login (sem isso,
# o cliente não consegue carregar a página de portal)
# --------------------------------------------------
/ip hotspot walled-garden
add dst-host=SEU-APP.vercel.app          comment="Portal Wi-Fi"
add dst-host=*.vercel.app                comment="Vercel CDN"
add dst-host=vercel-scripts.com          comment="Vercel scripts"
add dst-host=res.cloudinary.com          comment="Cloudinary imagens"
add dst-host=fonts.googleapis.com        comment="Google Fonts"
add dst-host=fonts.gstatic.com           comment="Google Fonts static"

# --------------------------------------------------
# 2. USUÁRIO GUEST (autenticação automática)
# --------------------------------------------------
/ip hotspot user
add name=guest password="" comment="Acesso automatico via portal"

# Perfil com limites de velocidade (ajuste conforme necessário)
/ip hotspot user profile
add name=guest-profile rate-limit="5M/5M" session-timeout=4h idle-timeout=30m

# Aplique o perfil ao usuário guest
/ip hotspot user
set [find name=guest] profile=guest-profile

# --------------------------------------------------
# 3. CONFIGURAÇÃO DO SERVIDOR HOTSPOT
# (ajuste "ether2" para a interface do seu AP UniFi)
# --------------------------------------------------
/ip hotspot setup
# Siga o wizard interativo:
#   hotspot interface: bridge1 (ou ether2/wlan1)
#   local address: 192.168.88.1/24
#   masquerade: yes
#   address pool: 192.168.88.10-192.168.88.254
#   SSL certificate: none
#   SMTP server: 0.0.0.0
#   DNS servers: 8.8.8.8
#   DNS name: hotspot.local (ou deixe em branco)
#   name of local hotspot user: admin (temporário, pode remover depois)

# --------------------------------------------------
# 4. VERIFICAÇÃO
# --------------------------------------------------
/ip hotspot print
/ip hotspot walled-garden print
/ip hotspot user print

# --------------------------------------------------
# OBSERVAÇÕES IMPORTANTES:
#
# - Após configurar, envie o arquivo mikrotik-login.html
#   para /flash/hotspot/login.html via FTP (porta 21)
#   ou Winbox > Files
#
# - FTP: ftp://192.168.88.1 (user: admin, senha: sua senha)
#   Navegue até /flash/hotspot/ e faça upload do arquivo
#
# - Teste acessando a rede Wi-Fi com um celular
#   e abrindo qualquer site HTTP (ex: http://example.com)
#   O MikroTik deve redirecionar para o portal
#
# - Sites HTTPS não redirecionam automaticamente (limitação
#   do protocolo). Use uma página HTTP como trigger, ou
#   configure DNS redirect no MikroTik
# ============================================================
