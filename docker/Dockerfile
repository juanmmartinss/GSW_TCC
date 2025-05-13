FROM python:3.11-slim
WORKDIR /app
# Adicionando o usuário do contêiner ao grupo 'dialout' (usuário típico para acesso a portas seriais)
RUN getent group dialout || groupadd -r dialout && usermod -aG dialout root
COPY ./app /app/app
COPY ./requirements.txt /app
RUN pip install -r requirements.txt
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
