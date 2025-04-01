const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favouriteBlog = (blogs) => {
    return blogs.reduce((favourite, currentBlog) => {
        return currentBlog.likes > favourite.likes ? currentBlog : favourite
    }, blogs[0])
}
  
module.exports = {
    dummy,
    totalLikes,
    favouriteBlog
}
