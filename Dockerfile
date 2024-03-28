FROM oven/bun:alpine

EXPOSE 8080

COPY index.ts /index.ts

CMD ["bun", "run", "/index.ts"]
