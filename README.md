# MultiModal-Gpt
MultiModal Gpt (early phase) is a advanced Multi modal AI which supports Texts, Pdfs, Image, Search engine etc 

## Technologies Used

**Front-end**
- NextJS(Typescript support)
- Markdown Support for Blogs
- Zod 
- Tailwind CSS
- Shadcn
- Clerk Authentication (Webhook support)
- Framer Motion

**Back-end**
- NodeJS(Bun support)
- Express
- Jest (Unit testing)
- Docker
- AWS S3
- Langchain
- Datastax (Vector store)
- Svix (Webhook support)

**For deployment**
- `Vercel` for frontend
- `fly.io + Docker` for backend

## Local Setup

- Install Node Modules
```
    git clone https://github.com/piyushyadav0191/MultiModal-Gpt
    cd MultiModel-Gpt/Multi-modal-Gpt && bun i 
    cd MultiModel-Gpt/MultiModal-GPT-backend && bun i
```

- Env variables
-- Copy .env.example variable names and create new .env and fill them your env variables

- Run Application
For frontend and backend both
```
    bun run dev
```
- Testing
```
    bun test
```

- Building for production
For frontend and backend both
```
    bun run build
```

- Running in production
For frontend and backend both
```
    bun start
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please reach out to us at [piyushyadav0191@gmail.com](mailto:piyushyadav0191@gmail.com).
