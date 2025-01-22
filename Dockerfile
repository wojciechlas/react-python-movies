FROM node:16.20.2-alpine AS frontend
COPY ui/package.json /var/app/ui
COPY ui/package-lock.json /var/app/ui
WORKDIR /var/app/ui
RUN npm ci
COPY ui/src /var/app/ui
RUN npm run build

FROM python:3.9
COPY --from=frontend /var/app/ui/build /var/app/ui/build
COPY requirements.txt /var/app/api/requirements.txt
WORKDIR /var/app/api
RUN pip install --no-cache-dir --upgrade -r /var/app/api/requirements.txt
COPY api /var/app/api
CMD ["fastapi", "run", "main.py", "--port", "80"]
