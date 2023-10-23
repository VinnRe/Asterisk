package com.burgis.loginsystem.controllers;

import java.util.Random;

public class CustomIdGenerator {
    public static String generateCustomId() {
        String uniquePart = generateUniquePart();

        return uniquePart;
    }

    private static String generateUniquePart() {
        Random random = new Random();
        StringBuilder customIdBuilder = new StringBuilder();

        for (int i = 0; i < 7; i++) {
            int randomDigit = random.nextInt(10);
            customIdBuilder.append(randomDigit);
        }

        return customIdBuilder.toString();
    }
}
