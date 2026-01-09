# MS-Cart

Serviço designado a criar, atualizar e fazer checkout de carrinhos

### Estrutura

<img width="595" height="319" alt="image" src="https://github.com/user-attachments/assets/270a739b-1288-4892-b138-2e6418e3f7db" />

### Serviços oferecidos/consumidos

<img width="710" height="292" alt="image" src="https://github.com/user-attachments/assets/65e9c8c1-ac2e-41ff-a3b7-1c4acef6cb0c" />

### Evidencia de testes Sonar

<img width="1917" height="909" alt="image" src="https://github.com/user-attachments/assets/7ad25d8d-8c00-4e3a-8449-3e31bd5b1f1f" />

### Estrutura de arquivos

```
.
├── serverless.yml # Definição da infraestrutura do projeto utilizando Serverless Framework
├── docker-compose.yml # Configuração de contâineres para rodar o projeto local
└── src
    ├── adapters/
        ├── driven # Serviços consumidos (Ex: RDS, SNS)
        └── driver # Serviços oferecidos (Ex: API HTTP usando Lambda + API Gateway)
    ├── core/
        ├── application/usecases # Regras de negócio
        └── domain
            ├── entities # Entidades do serviço
            └── ports # Definição de contratos para consumo/oferecimento de serviços
    ├── infra/
        ├── aws # Wrappers de clientes da AWS para consumo posterior
        └── di # Classes de preparação do usecase para execução
    └── utils
```

### Pré-requisitos

* Node 20
* Docker
* AWS Cli

### Rodando local

Para rodar localmente siga o passo-a-passo abaixo:

#### 1. Instalando dependências

```bash
npm install
```

#### 2. Configurar credenciais AWS

Procure em sua máquina onde fica armazenado o arquivo de credentials da AWS (No Linux geralmente fica em ~/.aws/credentials)

Garanta que haja um registro assim no seu arquivo:
```bash
[default]
aws_access_key_id = key
aws_secret_access_key = secret
```

#### 3. Deploy

Ao finalizar o deploy irá ser mostrado no console os endpoint criados que pode ser copiado para um Postman ou Insomnia para testes

```bash
npx sls deploy --stage local
```

Obs: se for preciso alterar algo no projeto, é necessário remover o serviço do localstack e deployar novamente. Para remover use:
```bash
npx sls remove --stage local
```
