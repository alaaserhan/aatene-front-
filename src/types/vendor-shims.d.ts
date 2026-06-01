declare module "jspdf" {
  export class jsPDF {
    constructor(...args: unknown[]);
    addFileToVFS(...args: unknown[]): void;
    addFont(...args: unknown[]): void;
    setFont(...args: unknown[]): void;
    setFontSize(...args: unknown[]): void;
    text(...args: unknown[]): void;
    addPage(...args: unknown[]): void;
    addImage(...args: unknown[]): void;
    save(...args: unknown[]): void;
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
  }
  export default jsPDF;
}

declare module "firebase/app" {
  export type FirebaseApp = object;
  export function initializeApp(config: Record<string, unknown>): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(): FirebaseApp;
}

declare module "firebase/messaging" {
  import type { FirebaseApp } from "firebase/app";

  export type Messaging = object;
  export interface MessagePayload {
    notification?: {
      title?: string;
      body?: string;
    };
    data?: Record<string, string>;
  }

  export function getMessaging(app?: FirebaseApp): Messaging;
  export function getToken(messaging: Messaging, options?: Record<string, unknown>): Promise<string>;
  export function deleteToken(messaging: Messaging): Promise<boolean>;
  export function isSupported(): Promise<boolean>;
  export function onMessage(
    messaging: Messaging,
    nextOrObserver: (payload: MessagePayload) => void
  ): () => void;
}

declare module "firebase/firestore" {
  import type { FirebaseApp } from "firebase/app";

  export type Firestore = object;
  export type Query = object;
  export type CollectionReference = object;
  export interface DocumentData {
    [field: string]: any;
  }
  export interface QueryDocumentSnapshot<T = DocumentData> {
    id: string;
    data(): T;
  }
  export interface QuerySnapshot<T = DocumentData> {
    forEach(callback: (doc: QueryDocumentSnapshot<T>) => void): void;
  }

  export function getFirestore(app?: FirebaseApp): Firestore;
  export function collection(
    firestore: Firestore,
    path: string,
    ...pathSegments: string[]
  ): CollectionReference;
  export function orderBy(fieldPath: string, directionStr?: "asc" | "desc"): unknown;
  export function query(
    query: CollectionReference,
    ...queryConstraints: unknown[]
  ): Query;
  export function onSnapshot<T = DocumentData>(
    query: Query,
    onNext: (snapshot: QuerySnapshot<T>) => void,
    onError?: (error: Error) => void
  ): () => void;
}
