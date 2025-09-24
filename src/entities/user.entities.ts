import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: "varchar", unique: true, length: 100 })
    email!: string;

    @Column({type: "varchar"})
    password!: string;  

    @Column({ type: "int", nullable: true })
    age!: number;

    @Column({ type: "varchar", nullable: true })
    refreshToken?: string;

    @Column({ type: "varchar", nullable: true })
    resetToken?: string;

    @Column({ type: "timestamp", nullable: true })
    resetTokenExpiry?: Date;

    @Column({ type: "varchar", default: "user" })
    role!: string;

    @CreateDateColumn({ type: "timestamp", name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
    updatedAt!: Date;
}
