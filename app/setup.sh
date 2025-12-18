#!/bin/bash

# Set up WSL2 Ubuntu 20.04 to run Laravel projects on Windows. 
# Only run what is needed (for instance, if we already have Ubuntu 22.04, we don't need to upgrade).

# Note: the do-release-upgrade step will stop the script to run interactively (it needs confirmation and will take a while). 
# After the upgrade finishes and you restart WSL, just re‑run the script — it will skip the finished parts and continue 
# with PHP 8.3, Composer, and CS Fixer.

# Make this file executable: chmod +x setup.sh
# run it ./setup.sh

set -e

# Update and upgrade everything on 20.04
sudo apt update
sudo apt upgrade -y
sudo apt full-upgrade -y
sudo apt autoremove -y

# Upgrade Ubuntu 20.04 -> 22.04
sudo apt install -y update-manager-core
sudo do-release-upgrade -f DistUpgradeViewNonInteractive || true

# After reboot/restart of WSL, run the rest:

# Add PHP repo and install PHP 8.3
sudo apt update
sudo apt install -y software-properties-common ca-certificates lsb-release apt-transport-https curl unzip
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3 php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl unzip
php -v

# Install Composer
cd ~
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer -V

# Install PHP CS Fixer
composer global require friendsofphp/php-cs-fixer
echo 'export PATH="$HOME/.config/composer/vendor/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
php-cs-fixer -V

# Start project
# npm run dev
# php artisan serve
# \\wsl$\Ubuntu\home\your-windows-username\git-repo-name
echo "Setup complete! You can now run your Laravel project."

# Remember to set up your .env file with the correct settings, including the new ones for Resend:
# MAIL_MAILER=resend
# MAIL_FROM_ADDRESS=
# MAIL_FROM_NAME=
# RESEND_API_KEY=
# RESEND_DOMAIN=

# You may need to install the required PHP SQLite extension for PHP 8.3
# before running php artisan migrate if your project uses SQLite and you get
# error "ould not find driver (Connection: sqlite, SQL: select exists 
# (select 1 from "main".sqlite_master where name = 'migrations' and type = 'table') as "exists")

# sudo apt update
# sudo apt install php8.3-sqlite3

# After installation, verify the extensions are loaded:
# php -m | grep -i pdo
# php -m | grep -i sqlite

# You should see:
# PDO
# pdo_sqlite
# sqlite3

# Then try running your migration again:
# php artisan migrate
