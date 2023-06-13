from src import create_app

app = create_app()

if __name__ == '__main__':
    # the application will only run if it was directly executed as a script
    app.run(host="0.0.0.0", debug=True)
