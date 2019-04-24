#!/usr/bin/env Rscript



######################################
#          Codes with Notes          #
#  For "The Beginner's Guide to R"   #
#         Author: Yiming Li          #
#            15 Mar, 2017            #
######################################



##### Section 2. Installation and "Hello World!" in R

### R "Hello World"
print("Hello World!")

### Install the package "ggplot2"
install.packages("ggplot2")

### Load the package "ggplot2"
library("ggplot2")

### Check the manual for print()
?print # Press "q" to exit from manual screen

### Exit from R
q()


##### Section 3. R data types

### Types of vectors
a <- c(1,2,5,3,6,-2,4) # Numeric vector
b <- c("one","two","three") # Character vector
c <- c(TRUE,TRUE,TRUE,FALSE,TRUE,FALSE) # Logical vector

### Check vector classes
class(a)
is.numeric(b)
is.character(b)
is.logical(c)

### Trying out c()
c(c(1, 2), c(3))

### Factors

## Unordered factor

mons <- c("March","April","January","November","January","September","October","September","November","August","January","November","November","February","May","August","July","December","August","August","September","November","February","April") # A character vector

mons2 <- factor(mons) # Convert to unordered factor

table(mons2) # Build contingency table

## Ordered factor

mons3 <- factor(mons, levels = c("January","February","March","April","May","June","July","August","September","October","November","December"), ordered = TRUE) # Convert to ordered factor

mons3[1] < mons3[2] # Now we could do comparison

table(mons3) # Build contingency table

## Ordered factor (2nd example)

fert <- c(10,20,20,50,10,20,10,50,20) # A character vector

fert <- factor(fert, levels = c(10,20,50), ordered = TRUE) # Convert to ordered factor

levels(fert) # Check the levels of fert

mean(as.numeric(levels(fert)[fert])) # Calculate the mean of the original numeric values of the fert variable

### Matrices

A <- matrix( 
	c(2,4,3,1,5,7),		# The data elements 
	nrow = 2,			# Number of rows 
	ncol = 3,			# Number of columns 
	byrow = TRUE)		# Fill matrix by rows 

dimnames(A) <- list( 
	c("row1", "row2"),			# Row names 
	c("col1", "col2", "col3"))	# Column names

A[2,3] # Element at position (2,3)

A["row2", "col3"] # Refer by row name and column name

A[2,] # Get the 2nd row

A[,3] # Get the 3rd column

A[,c(1,3)] # Get sub-matrix

t(A) # Transpose of A

### Data frames

d <- c(1,2,3,4)
e <- c("red","white","red",NA)
f <- c(TRUE,TRUE,TRUE,FALSE)
mydata <- data.frame(d,e,f) # A data frame
# mydata <- data.frame(d,e,f, stringsAsFactors = FALSE) # mydata$e would be a character vector

colnames(mydata) <- c("ID","Color","Passed") # Column names (header)

nrow(mydata) # Number of rows

ncol(mydata) # Number of columns

dim(mydata) # Dimensions

str(mydata) # Get a summary of the data frame

head(mydata) # Show first several rows
# head(mydata, n = 3)



##### Section 4. R operators and managing a data frame

### Subsetting

mydata[4,] # Select 4th row

mydata[,c(2:3)] # Select the 2nd and 3rd columns

mydata$ID # Select the column named "ID"

mydata[which(mydata$Passed & mydata$ID > 2), ] # Select observation(s) by value

### Sampling

set.seed(42) # Set random seed, for replicable results
mydata[sample(1:nrow(mydata),2,replace=FALSE),] # Randomly sample 2 rows

### Adding variables

# Adding a new variable called weight
mydata$weight <- seq(from = 65, to = 80, by = 5)

# Adding a new variable called height
mydata$height <- rep(170, 4)

# Adding a new variable calculated based on weight and height
mydata$bmi <- mydata$weight / (mydata$height/100)^2

# Adding a new logical variable based on bmi
mydata$overwt <- mydata$bmi >= 25

### Excluding variables

# Exclude variables ID, Color
myvars <- colnames(mydata) %in% c("ID", "Color") 
newdata <- mydata[!myvars]

# Exclude 1st and 3rd variables
newdata2 <- mydata[c(-1,-3)]

### Dropping variables

# Delete variable Color
# Color would be permanently dropped from mydata!
mydata$Color <- NULL

### Sorting

# Sort by descending weight and ascending height
sortedData <- mydata[order(-mydata$weight, mydata$height),]



##### Section 5. I/O and basic graphs in R

### Importing and exporting data

# Write data frame to text file
write.table(mydata, file = "datFile.txt", sep = "\t", quote = FALSE, row.names = FALSE, col.names = TRUE)

# Write all R objects in the current workspace to RData file
save(file = "savedData.RData", list = ls())

# Read data from text file into data frame
mydataRead <- read.table(file = "datFile.txt", sep = "\t", header = TRUE)

# Reload datasets previously written with the function "save"
load("savedData.RData")

### Simple data visualisation: "Like regular chickens"

# Check all R's built-in data sets
library(help = "datasets")

str(ChickWeight)

# Simple histogram
hist(ChickWeight$weight[ChickWeight$Time == 0], main = "Distribution of Chicken Weight at Time 0", xlab = "Weight")

# Simple scatterplot
plot(ChickWeight$Time, ChickWeight$weight, main = "Change of Chicken Weight Over Time", xlab = "Time", ylab = "Weight")

# Scatterplot using ggplot2
# library("ggplot2")
qplot(Time, weight, data = ChickWeight, colour = Diet)

# Save scatterplot with loess smoothing to pdf file
pdf("LRCvis.pdf")
qplot(Time, weight, data = ChickWeight, colour = Diet, geom = c("point", "smooth"))
dev.off()
