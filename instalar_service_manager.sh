#!/bin/bash
set -e

echo "Instalando inicialização automática do VRServiceManager..."

docker-compose -f ~/.vr/docker-compose-sm-sc.yml down

docker-compose -f ~/.vr/docker-compose-sm-sc.yml up -d

cat > ~/reiniciar_vrservicemanager.sh << 'EOF'
#!/bin/bash

sleep 30

cd ~/.vr/

docker-compose -f docker-compose-sm-sc.yml down
docker-compose -f docker-compose-sm-sc.yml up -d

#zenity --info --title="VRServiceManager" --text="VR Service Manager reiniciado com sucesso!"
EOF

chmod +x ~/reiniciar_vrservicemanager.sh

mkdir -p ~/.config/autostart

cat > ~/.config/autostart/vrservicemanager.desktop << EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=VRServiceManager
Comment=Reinicia automaticamente o VRServiceManager
Exec=$HOME/reiniciar_vrservicemanager.sh
Terminal=false
X-GNOME-Autostart-enabled=true
EOF

echo
echo "========================================="
echo "Configuração concluída com sucesso!"
echo "O VRServiceManager será reiniciado"
echo "automaticamente após o login no Ubuntu."
echo "========================================="