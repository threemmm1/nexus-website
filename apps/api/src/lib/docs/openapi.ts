import type { OpenAPIV3 } from 'openapi-types';
import { env } from '../../config/env';

// ─── Reusable components ──────────────────────────────────────────────────────

const bearerAuth: OpenAPIV3.SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Access token obtained from POST /auth/login',
};

const errorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    data: { type: 'object', nullable: true },
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'INVALID_TOKEN' },
        message: { type: 'string', example: 'Invalid or expired token' },
        details: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
      },
    },
  },
};

const paginationMeta: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 20 },
    total: { type: 'integer', example: 100 },
    totalPages: { type: 'integer', example: 5 },
    hasNext: { type: 'boolean' },
    hasPrev: { type: 'boolean' },
  },
};

function success(data: OpenAPIV3.SchemaObject, withMeta = false): OpenAPIV3.ResponseObject {
  return {
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data,
            ...(withMeta ? { meta: paginationMeta } : {}),
            error: { type: 'object', nullable: true },
          },
        },
      },
    },
  };
}

const r401: OpenAPIV3.ResponseObject = { description: 'Unauthorized', content: { 'application/json': { schema: errorSchema } } };
const r403: OpenAPIV3.ResponseObject = { description: 'Forbidden', content: { 'application/json': { schema: errorSchema } } };
const r404: OpenAPIV3.ResponseObject = { description: 'Not found', content: { 'application/json': { schema: errorSchema } } };
const r422: OpenAPIV3.ResponseObject = { description: 'Validation error', content: { 'application/json': { schema: errorSchema } } };
const r429: OpenAPIV3.ResponseObject = { description: 'Rate limited', content: { 'application/json': { schema: errorSchema } } };

// ─── Shared schemas ───────────────────────────────────────────────────────────

const UserSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    username: { type: 'string', example: 'victor_v' },
    displayName: { type: 'string', example: 'Victor V' },
    avatarUrl: { type: 'string', nullable: true },
    bannerUrl: { type: 'string', nullable: true },
    bio: { type: 'string', nullable: true },
    website: { type: 'string', nullable: true },
    location: { type: 'string', nullable: true },
    role: { type: 'string', enum: ['user', 'creator', 'seller', 'moderator', 'admin'] },
    isCreator: { type: 'boolean' },
    isSeller: { type: 'boolean' },
    followersCount: { type: 'integer' },
    followingCount: { type: 'integer' },
    postsCount: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const MediaAssetSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    url: { type: 'string' },
    thumbnailUrl: { type: 'string', nullable: true },
    type: { type: 'string', enum: ['image', 'video'] },
    width: { type: 'integer', nullable: true },
    height: { type: 'integer', nullable: true },
    duration: { type: 'number', nullable: true },
    order: { type: 'integer' },
  },
};

const PostSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    caption: { type: 'string', nullable: true },
    status: { type: 'string', enum: ['processing', 'active', 'removed', 'flagged'] },
    likesCount: { type: 'integer' },
    commentsCount: { type: 'integer' },
    sharesCount: { type: 'integer' },
    savesCount: { type: 'integer' },
    viewsCount: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    author: UserSchema,
    media: { type: 'array', items: MediaAssetSchema },
    hashtags: { type: 'array', items: { type: 'string' } },
    isLiked: { type: 'boolean', description: 'Only present when authenticated' },
    isSaved: { type: 'boolean', description: 'Only present when authenticated' },
  },
};

const CommentSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    postId: { type: 'string' },
    parentId: { type: 'string', nullable: true },
    body: { type: 'string' },
    likesCount: { type: 'integer' },
    repliesCount: { type: 'integer' },
    createdAt: { type: 'string', format: 'date-time' },
    author: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        displayName: { type: 'string' },
        avatarUrl: { type: 'string', nullable: true },
      },
    },
  },
};

const AuthTokensSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    userId: { type: 'string' },
    accessToken: { type: 'string', description: 'JWT — expires in 15 minutes' },
    refreshToken: { type: 'string', description: 'Opaque token — expires in 30 days' },
    expiresIn: { type: 'integer', example: 900 },
  },
};

// ─── Pagination query params ──────────────────────────────────────────────────

const pageParam: OpenAPIV3.ParameterObject = { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } };
const limitParam: OpenAPIV3.ParameterObject = { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } };

// ─── Full spec ────────────────────────────────────────────────────────────────

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'VESIOH API',
    version: '1.0.0',
    description: `
## VESIOH — All-in-one social, gaming & marketplace platform

**Base URL:** \`${env.API_URL}/api/v1\`

### Authentication
Use **Bearer token** — obtain via \`POST /auth/login\`.
Include as: \`Authorization: Bearer <accessToken>\`

Access tokens expire in **15 minutes**. Use \`POST /auth/refresh\` with your refresh token to get a new pair silently.

### Response envelope
Every response is wrapped:
\`\`\`json
{ "success": true, "data": { ... }, "meta": { ... }, "error": null }
{ "success": false, "data": null, "error": { "code": "...", "message": "..." } }
\`\`\`
    `,
    contact: { name: 'VESIOH Engineering', email: 'eng@vesioh.com' },
  },
  servers: [
    { url: `${env.API_URL}/api/v1`, description: 'Current environment' },
    { url: 'http://localhost:4000/api/v1', description: 'Local dev' },
  ],
  components: {
    securitySchemes: { bearerAuth },
    schemas: { User: UserSchema, Post: PostSchema, Comment: CommentSchema, MediaAsset: MediaAssetSchema, AuthTokens: AuthTokensSchema, Error: errorSchema },
  },
  tags: [
    { name: 'Auth', description: 'Register, login, token refresh, phone verify' },
    { name: 'Users', description: 'Profiles, follow graph, block list' },
    { name: 'Posts', description: 'Create & browse posts, like, save, comment' },
    { name: 'Feed', description: 'Following feed, explore, trending' },
  ],
  paths: {

    // ── AUTH ──────────────────────────────────────────────────────────────────

    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['email', 'username', 'displayName', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'victor@vesioh.com' },
                  username: { type: 'string', minLength: 3, maxLength: 30, example: 'victor_v', description: 'Letters, numbers, underscores only' },
                  displayName: { type: 'string', maxLength: 50, example: 'Victor V' },
                  password: { type: 'string', minLength: 8, example: 'Secret123!', description: 'Min 8 chars, 1 uppercase, 1 number' },
                },
              },
            },
          },
        },
        responses: {
          '201': success({ type: 'object', properties: { userId: { type: 'string' }, message: { type: 'string' } } }),
          '409': { description: 'Email or username already taken', content: { 'application/json': { schema: errorSchema } } },
          '422': r422,
          '429': r429,
        },
      },
    },

    '/auth/verify-email/{token}': {
      get: {
        tags: ['Auth'],
        summary: 'Verify email address',
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '400': { description: 'Invalid/expired token', content: { 'application/json': { schema: errorSchema } } } },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': success(AuthTokensSchema), '401': { description: 'Invalid credentials', content: { 'application/json': { schema: errorSchema } } }, '422': r422, '429': r429 },
      },
    },

    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } } } },
        },
        responses: { '200': success(AuthTokensSchema), '401': r401 },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (revokes refresh token)',
        security: [{ bearerAuth: [] }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get own account (full, including private fields)',
        security: [{ bearerAuth: [] }],
        responses: { '200': success(UserSchema), '401': r401 },
      },
    },

    '/auth/phone/send-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Send phone verification OTP via SMS',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['phone'], properties: { phone: { type: 'string', example: '+12025550123', description: 'E.164 format' } } } } },
        },
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401, '409': { description: 'Phone already in use', content: { 'application/json': { schema: errorSchema } } } },
      },
    },

    '/auth/phone/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Verify phone OTP',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['otp'], properties: { otp: { type: 'string', example: '123456' } } } } },
        },
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '400': { description: 'Invalid OTP', content: { 'application/json': { schema: errorSchema } } }, '401': r401 },
      },
    },

    // ── USERS ─────────────────────────────────────────────────────────────────

    '/users/search': {
      get: {
        tags: ['Users'],
        summary: 'Search users by username or display name',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 1 } },
          pageParam, limitParam,
        ],
        responses: { '200': success({ type: 'array', items: UserSchema }, true) },
      },
    },

    '/users/check-username/{username}': {
      get: {
        tags: ['Users'],
        summary: 'Check if a username is available',
        parameters: [{ name: 'username', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { username: { type: 'string' }, available: { type: 'boolean' } } }) },
      },
    },

    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get own public profile',
        security: [{ bearerAuth: [] }],
        responses: { '200': success(UserSchema), '401': r401 },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update own profile (bio, displayName, website, location)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  displayName: { type: 'string', maxLength: 50 },
                  bio: { type: 'string', maxLength: 300 },
                  website: { type: 'string', format: 'uri' },
                  location: { type: 'string', maxLength: 100 },
                },
              },
            },
          },
        },
        responses: { '200': success(UserSchema), '401': r401, '422': r422 },
      },
    },

    '/users/me/username': {
      patch: {
        tags: ['Users'],
        summary: 'Change username',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['username'], properties: { username: { type: 'string', minLength: 3, maxLength: 30 } } } } },
        },
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401, '409': { description: 'Username taken', content: { 'application/json': { schema: errorSchema } } } },
      },
    },

    '/users/me/avatar/request-upload': {
      post: {
        tags: ['Users'],
        summary: 'Step 1 — Get a presigned S3 URL to upload your avatar directly',
        description: 'Client uploads directly to the returned `uploadUrl` using a PUT request with the correct Content-Type header. Then calls `/confirm`.',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['contentType'], properties: { contentType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] } } } } } },
        responses: { '200': success({ type: 'object', properties: { uploadUrl: { type: 'string', description: 'Presigned S3 PUT URL — valid 5 min' }, cdnUrl: { type: 'string', description: 'Final CDN URL to store and display' }, s3Key: { type: 'string' } } }), '401': r401 },
      },
    },

    '/users/me/avatar/confirm': {
      post: {
        tags: ['Users'],
        summary: 'Step 2 — Confirm avatar upload after direct S3 upload',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['cdnUrl'], properties: { cdnUrl: { type: 'string', format: 'uri' } } } } } },
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    '/users/me/banner/request-upload': {
      post: {
        tags: ['Users'],
        summary: 'Step 1 — Get presigned S3 URL to upload banner',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['contentType'], properties: { contentType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] } } } } } },
        responses: { '200': success({ type: 'object', properties: { uploadUrl: { type: 'string' }, cdnUrl: { type: 'string' }, s3Key: { type: 'string' } } }), '401': r401 },
      },
    },

    '/users/me/banner/confirm': {
      post: {
        tags: ['Users'],
        summary: 'Step 2 — Confirm banner upload',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['cdnUrl'], properties: { cdnUrl: { type: 'string', format: 'uri' } } } } } },
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    '/users/me/blocked': {
      get: {
        tags: ['Users'],
        summary: 'Get own blocked users list',
        security: [{ bearerAuth: [] }],
        parameters: [pageParam, limitParam],
        responses: { '200': success({ type: 'array', items: UserSchema }, true), '401': r401 },
      },
    },

    '/users/{username}': {
      get: {
        tags: ['Users'],
        summary: 'Get public profile by username',
        parameters: [{ name: 'username', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ ...UserSchema, properties: { ...UserSchema.properties, isFollowing: { type: 'boolean' }, isBlocked: { type: 'boolean' }, isOwnProfile: { type: 'boolean' } } }), '404': r404 },
      },
    },

    '/users/{userId}/follow': {
      post: {
        tags: ['Users'],
        summary: 'Follow a user (idempotent)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '400': { description: 'Cannot follow yourself', content: { 'application/json': { schema: errorSchema } } }, '401': r401, '403': r403 },
      },
      delete: {
        tags: ['Users'],
        summary: 'Unfollow a user (idempotent)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    '/users/{userId}/follower': {
      delete: {
        tags: ['Users'],
        summary: 'Remove someone from your own followers',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    '/users/{userId}/follow-status': {
      get: {
        tags: ['Users'],
        summary: 'Check follow status between you and another user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { isFollowing: { type: 'boolean' }, isFollowedBy: { type: 'boolean' } } }), '401': r401 },
      },
    },

    '/users/{userId}/followers': {
      get: {
        tags: ['Users'],
        summary: "Get a user's followers",
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }, pageParam, limitParam],
        responses: { '200': success({ type: 'array', items: UserSchema }, true) },
      },
    },

    '/users/{userId}/following': {
      get: {
        tags: ['Users'],
        summary: 'Get who a user is following',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }, pageParam, limitParam],
        responses: { '200': success({ type: 'array', items: UserSchema }, true) },
      },
    },

    '/users/{userId}/block': {
      post: {
        tags: ['Users'],
        summary: 'Block a user (removes follows in both directions)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
      delete: {
        tags: ['Users'],
        summary: 'Unblock a user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    // ── POSTS ─────────────────────────────────────────────────────────────────

    '/posts/media/request-upload': {
      post: {
        tags: ['Posts'],
        summary: 'Request presigned S3 URLs for up to 10 media files',
        description: 'Returns one upload slot per file. Client uploads each file directly to its `uploadUrl`. Pass the confirmed slots back when creating the post.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object', required: ['files'],
                properties: { files: { type: 'array', maxItems: 10, items: { type: 'object', properties: { contentType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'] } } } } },
              },
            },
          },
        },
        responses: {
          '200': success({ type: 'array', items: { type: 'object', properties: { uploadId: { type: 'string' }, uploadUrl: { type: 'string' }, cdnUrl: { type: 'string' }, s3Key: { type: 'string' }, kind: { type: 'string', enum: ['image', 'video'] } } } }),
          '400': { description: 'Too many files or invalid type', content: { 'application/json': { schema: errorSchema } } },
          '401': r401, '429': r429,
        },
      },
    },

    '/posts/saved': {
      get: {
        tags: ['Posts'],
        summary: 'Get own saved posts',
        security: [{ bearerAuth: [] }],
        parameters: [pageParam, limitParam],
        responses: { '200': success({ type: 'array', items: PostSchema }, true), '401': r401 },
      },
    },

    '/posts/hashtag/{tag}': {
      get: {
        tags: ['Posts'],
        summary: 'Get posts by hashtag',
        parameters: [{ name: 'tag', in: 'path', required: true, schema: { type: 'string', example: 'gaming' } }, pageParam, limitParam],
        responses: { '200': success({ type: 'object', properties: { hashtag: { type: 'object' }, posts: { type: 'array', items: PostSchema } } }, true), '404': r404 },
      },
    },

    '/posts/user/{userId}': {
      get: {
        tags: ['Posts'],
        summary: "Get a user's posts",
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }, pageParam, limitParam],
        responses: { '200': success({ type: 'array', items: PostSchema }, true) },
      },
    },

    '/posts': {
      post: {
        tags: ['Posts'],
        summary: 'Create a post (text, photo, or video)',
        description: 'Pass confirmed media slots from `/posts/media/request-upload`. Hashtags are extracted from caption automatically — no need to duplicate them in `hashtags`.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  caption: { type: 'string', maxLength: 2200, example: 'Grinding ranked 🎮 #gaming #vesioh' },
                  hashtags: { type: 'array', items: { type: 'string' }, description: 'Optional extra tags beyond those in caption' },
                  media: {
                    type: 'array', maxItems: 10,
                    items: {
                      type: 'object', required: ['cdnUrl', 's3Key', 'contentType', 'kind', 'order'],
                      properties: {
                        cdnUrl: { type: 'string' }, s3Key: { type: 'string' },
                        contentType: { type: 'string' }, kind: { type: 'string', enum: ['image', 'video'] },
                        width: { type: 'integer' }, height: { type: 'integer' },
                        duration: { type: 'number' }, sizeBytes: { type: 'integer' },
                        order: { type: 'integer', minimum: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { '201': success(PostSchema), '400': { description: 'Empty post', content: { 'application/json': { schema: errorSchema } } }, '401': r401, '422': r422 },
      },
    },

    '/posts/{postId}': {
      get: {
        tags: ['Posts'],
        summary: 'Get a single post',
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success(PostSchema), '404': r404 },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Delete a post (owner or moderator)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401, '403': r403, '404': r404 },
      },
    },

    '/posts/{postId}/like': {
      post: {
        tags: ['Posts'], summary: 'Like a post (idempotent)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401, '404': r404 },
      },
      delete: {
        tags: ['Posts'], summary: 'Unlike a post (idempotent)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    '/posts/{postId}/save': {
      post: {
        tags: ['Posts'], summary: 'Save a post (idempotent)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401, '404': r404 },
      },
      delete: {
        tags: ['Posts'], summary: 'Unsave a post (idempotent)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    '/posts/{postId}/comments': {
      post: {
        tags: ['Posts'], summary: 'Add a comment or reply to a post',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['body'], properties: { body: { type: 'string', maxLength: 1000 }, parentId: { type: 'string', description: 'ID of parent comment for replies' } } } } } },
        responses: { '201': success(CommentSchema), '400': { description: 'Nesting too deep', content: { 'application/json': { schema: errorSchema } } }, '401': r401, '404': r404 },
      },
      get: {
        tags: ['Posts'], summary: 'Get top-level comments for a post',
        parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }, pageParam, limitParam],
        responses: { '200': success({ type: 'array', items: CommentSchema }, true) },
      },
    },

    '/posts/comments/{commentId}/replies': {
      get: {
        tags: ['Posts'], summary: 'Get replies for a comment',
        parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }, pageParam, limitParam],
        responses: { '200': success({ type: 'array', items: CommentSchema }, true) },
      },
    },

    '/posts/comments/{commentId}': {
      delete: {
        tags: ['Posts'], summary: 'Delete a comment (owner or moderator)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401, '403': r403, '404': r404 },
      },
    },

    '/posts/comments/{commentId}/like': {
      post: {
        tags: ['Posts'], summary: 'Like a comment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
      delete: {
        tags: ['Posts'], summary: 'Unlike a comment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', properties: { message: { type: 'string' } } }), '401': r401 },
      },
    },

    // ── FEED ──────────────────────────────────────────────────────────────────

    '/feed': {
      get: {
        tags: ['Feed'],
        summary: 'Get personalised following feed',
        description: 'Scored & ranked posts from accounts you follow. Falls back to explore feed if you follow nobody. Cached per user for 5 minutes.',
        security: [{ bearerAuth: [] }],
        parameters: [pageParam, limitParam],
        responses: { '200': success({ type: 'object', properties: { posts: { type: 'array', items: PostSchema }, hasMore: { type: 'boolean' } } }), '401': r401 },
      },
    },

    '/feed/explore': {
      get: {
        tags: ['Feed'],
        summary: 'Get explore / trending feed (public)',
        description: 'Top-scored posts from the last 3 days across all public accounts.',
        parameters: [pageParam, limitParam],
        responses: { '200': success({ type: 'object', properties: { posts: { type: 'array', items: PostSchema }, hasMore: { type: 'boolean' } } }) },
      },
    },

    '/feed/trending/hashtags': {
      get: {
        tags: ['Feed'],
        summary: 'Get trending hashtags',
        parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } }],
        responses: { '200': success({ type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, postsCount: { type: 'integer' } } } }) },
      },
    },

    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications (paginated)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: {
          '200': success({
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string', enum: ['like', 'comment', 'follow', 'mention', 'gift', 'stream_live', 'dm', 'system', 'tournament'] },
                title: { type: 'string' },
                body: { type: 'string' },
                imageUrl: { type: 'string', nullable: true },
                referenceId: { type: 'string', nullable: true },
                isRead: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          }, true),
          '401': r401,
        },
      },
    },

    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': success({ type: 'object', properties: { count: { type: 'integer' } } }),
          '401': r401,
        },
      },
    },

    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: { '200': success({ type: 'object', nullable: true }), '401': r401 },
      },
    },

    '/notifications/{notificationId}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a single notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': success({ type: 'object', nullable: true }), '401': r401, '403': r403, '404': r404 },
      },
    },

    '/notifications/{notificationId}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a notification',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' }, '401': r401, '403': r403, '404': r404 },
      },
    },

    '/notifications/preferences': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notification preferences',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': success({
            type: 'object',
            properties: {
              likes: { type: 'boolean' },
              comments: { type: 'boolean' },
              follows: { type: 'boolean' },
              mentions: { type: 'boolean' },
              gifts: { type: 'boolean' },
              streamLive: { type: 'boolean' },
              dms: { type: 'boolean' },
              system: { type: 'boolean' },
            },
          }),
          '401': r401,
        },
      },
      patch: {
        tags: ['Notifications'],
        summary: 'Update notification preferences',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  likes: { type: 'boolean' },
                  comments: { type: 'boolean' },
                  follows: { type: 'boolean' },
                  mentions: { type: 'boolean' },
                  gifts: { type: 'boolean' },
                  streamLive: { type: 'boolean' },
                  dms: { type: 'boolean' },
                  system: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { '200': success({ type: 'object' }), '401': r401, '422': r422 },
      },
    },

    '/notifications/fcm-token': {
      post: {
        tags: ['Notifications'],
        summary: 'Register FCM device token for push notifications',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['token'], properties: { token: { type: 'string' } } } } },
        },
        responses: { '200': success({ type: 'object', nullable: true }), '401': r401, '422': r422 },
      },
      delete: {
        tags: ['Notifications'],
        summary: 'Remove FCM device token (logout / notification opt-out)',
        security: [{ bearerAuth: [] }],
        responses: { '200': success({ type: 'object', nullable: true }), '401': r401 },
      },
    },
  },
};
