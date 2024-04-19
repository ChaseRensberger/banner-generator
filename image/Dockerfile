FROM public.ecr.aws/lambda/nodejs:20

COPY src/package*.json ./

RUN npm install

# Copy function code
COPY src/* ${LAMBDA_TASK_ROOT}
  
# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "index.handler" ]