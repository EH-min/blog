import { Post, PostCreateRequest } from '../types';

// Ideally this comes from process.env
// const API_BASE_URL = 'http://localhost:8080'; 

// MOCK DATA for demonstration since backend connection isn't guaranteed in this environment
const MOCK_POSTS: Post[] = [
    {
        id: 1,
        title: "전략 패턴, 코틀린과 스프링으로 효율적으로 써보자",
        content: "먼저 이 글은 **Kotlin + Spring** 기준으로 작성된 글임을 알립니다.\n\n코드를 작성하다 보면 여러 분기에 따라서 다른 로직을 적용해야 하는 경우를 심심찮게 볼 수 있습니다. 간단한 예시를 만들어보겠습니다. 쇼핑몰 등 결제가 필요한 서비스에서 신용카드, 휴대폰결제, 간편결제, 무통장입금 이렇게 네 가지 결제 방식을 지원한다고 해보겠습니다.\n\n```kotlin\ninterface PaymentStrategy {\n    fun pay(amount: Long)\n}\n```\n\n이런 식으로 전략 패턴을 도입하면 유지보수가 쉬워집니다.",
        slug: "strategy-pattern-kotlin",
        seriesName: "디자인 패턴 정복",
        tags: ["Spring", "Kotlin", "DesignPattern"],
        createdAt: "2024-03-01T10:00:00"
    },
    {
        id: 2,
        title: "은행 개발자와 알아보는 코틀린 BigDecimal",
        content: "개발을 하다 보면 소수를 나타내거나 소수를 가지고 연산을 해야 하는 경우가 많습니다. \n\n별 반 개 단위로 나타낼 수 있는 별점을 나타내거나, 정수로 나타낸 점수지만 평균을 구하거나... 정말 많은 곳에 소수를 사용해야 합니다. \n\n특히나 **금전** 관련되어서는 더 많은 사용처가 존재합니다.",
        slug: "kotlin-bigdecimal",
        seriesName: null,
        tags: ["Java", "Kotlin", "Money"],
        createdAt: "2024-02-12T15:30:00"
    },
    {
        id: 3,
        title: "JPA 정복하기: N+1 문제 해결",
        content: "# JPA N+1 문제\n\nJPA를 사용하다 보면 가장 흔하게 마주치는 성능 문제입니다. \n\n`Fetch Join`을 사용하여 해결할 수 있습니다.\n\n```java\n@Query(\"select p from Post p join fetch p.comments\")\nList<Post> findAllWithComments();\n```",
        slug: "jpa-n-plus-one",
        seriesName: "스프링 부트 시리즈",
        tags: ["JPA", "Spring", "Database"],
        createdAt: "2024-01-20T09:00:00"
    }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getPosts = async (): Promise<Post[]> => {
    try {
        // Try real API first
        // const response = await axios.get(`${API_BASE_URL}/posts`);
        // return response.data;

        // Fallback to Mock
        await delay(500);
        return [...MOCK_POSTS];
    } catch (error) {
        console.error("API Error, using mock data", error);
        return MOCK_POSTS;
    }
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
    try {
        // const response = await axios.get(`${API_BASE_URL}/posts/${slug}`);
        // return response.data;

        await delay(500);
        return MOCK_POSTS.find(p => p.slug === slug) || null;
    } catch (error) {
        console.error("API Error, using mock data", error);
        return null;
    }
};

export const createPost = async (data: PostCreateRequest): Promise<Post> => {
    try {
        // const response = await axios.post(`${API_BASE_URL}/posts`, data);
        // return response.data;

        await delay(800);
        const newPost: Post = {
            id: Math.floor(Math.random() * 1000),
            title: data.title,
            content: data.content,
            slug: data.slug,
            seriesName: data.seriesName || null,
            tags: data.tags,
            createdAt: new Date().toISOString(),
        };
        MOCK_POSTS.unshift(newPost);
        return newPost;
    } catch (error) {
        console.error("API Error", error);
        throw error;
    }
};
