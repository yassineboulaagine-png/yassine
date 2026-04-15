run:
	(php artisan serve & npm run dev)

# Hadi l-ay wahed bgha i-stalli l-projet m-zdiro
install:
	composer install
	npm install
	cp .env.example .env
	php artisan key:generate

# Hadi bach t-nqi l-cache ila t-bloka lik chi haja
clean:
	php artisan cache:clear
	php artisan config:clear
	php artisan view:clear