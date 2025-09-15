plugins {
  id("org.jlleitschuh.gradle.ktlint") version "13.1.0"
}

buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath("com.android.tools.build:gradle:8.11.0")
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.2.20")
  }
}

allprojects {
  repositories {
    google()
    mavenCentral()
  }
}

tasks.register("clean").configure { delete("build") }